import os
from typing import List

from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import (
    ConversationalRetrievalChain,
)
from langchain.chat_models import ChatOpenAI

from langchain.docstore.document import Document
from langchain.memory import ChatMessageHistory, ConversationBufferMemory
import shutil
import chainlit as cl
import io
import time
from langchain.embeddings import HuggingFaceBgeEmbeddings
from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from langchain.retrievers import ParentDocumentRetriever
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceBgeEmbeddings
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.llms.huggingface_pipeline import HuggingFacePipeline
from langchain.storage._lc_store import create_kv_docstore
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain.document_loaders import DirectoryLoader, UnstructuredFileLoader
import PyPDF2
from dotenv import load_dotenv
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.environ.get('OPENAI_API_KEY3')


text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
device_type = 'cpu'

model_name = "BAAI/bge-small-en-v1.5"

encode_kwargs = {'normalize_embeddings': True} # set True to compute cosine similarity

EMBEDDINGS = HuggingFaceBgeEmbeddings(
    model_name=model_name,
    model_kwargs={'device': device_type },
    encode_kwargs=encode_kwargs
)
def create_faiss_vectordb_for_document_qna(user_data_directory="user_data",embeddings=EMBEDDINGS):
  loader = DirectoryLoader(user_data_directory, loader_cls=PyPDFLoader)
  docs = loader.load()
  doc_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
  split_docs = doc_splitter.split_documents(docs)
  trans_texts = [doc.page_content for doc in split_docs]

  
  print('CREATING EMBEDDINGS FOR USER DOCUMENT',trans_texts)
  vectordb = FAISS.from_texts(trans_texts, embedding=embeddings)
  print('FAISS VECTOR DATABASE CREATED')
  vectordb.save_local("faiss_index")

  return vectordb


@cl.on_chat_start
async def on_chat_start():
    if not os.path.exists("temporary_vectordb"):
        os.makedirs("temporary_vectordb")
    files = None
    directory_faiss = "faiss_index"
    directory = "user_data"
    # Wait for the user to upload a file
    while files == None:
        files = await cl.AskFileMessage(
            content="Please upload a text file or a PDF file to begin!",
            accept=["text/plain", "application/pdf"],
            max_size_mb=80,
            timeout=380,
        ).send()

    file = files[0]

    msg = cl.Message(content="")
    await msg.send()
    await cl.sleep(2)
    for file in files:
        print('FILEEEEEEEEEEEE',file)
        # with open(file.path, "rb") as file:
        #     pdf_reader = PyPDF2.PdfReader(file)
        #     text = ""
        #     for page_num in range(len(pdf_reader.pages)):
        #         page = pdf_reader.pages[page_num]
        #         text += page.extract_text()
        # encoded_text = text.encode('utf-8')
        file_buffer = io.BytesIO(file.content)
        print("file buffer",file_buffer)
        if not os.path.exists(directory):
            os.makedirs(directory)

        # Creating The Directory For Faiss Index
        if not os.path.exists(directory_faiss):
            os.makedirs(directory_faiss)

        with open(os.path.join(directory, file.name), "wb") as local_file:
            local_file.write(file_buffer.getvalue())

        # Wait Until The File Is Downloaded
        while not os.path.exists(os.path.join(directory, file.name)):
            time.sleep(1)

    faiss_vectordb = create_faiss_vectordb_for_document_qna()

    if os.path.exists(directory):
        shutil.rmtree(directory)
        print(f"The directory {directory} has been deleted.")
    else:
        print(f"The directory {directory} does not exist.")
  
    llm = ChatOpenAI(model='gpt-3.5-turbo-1106',temperature=0)
    # system_message_prompt = SystemMessagePromptTemplate.from_template(
    #         "I want you to act as a law agent, understanding all laws and related jargon, and explaining them in a simpler and descriptive way. Return a list of all the related LAWS drafted and provided in the Context for the user_input question and provide proper penal codes if applicable from the ingested PDF, and explain the process and terms in a simpler way. Dont go beyond the context of the pdf please be precise and accurate. The context is:\n{context}\n\n This is the extra textbook context provided to you. User both the information to answer user query. TEXTBOOK CONTEXT:{textbook_context}. {human_input}"
    #     )
    system_message_prompt = SystemMessagePromptTemplate.from_template(
            "You are an educational assitant and you are supposed to explain educational concepts to user in a simplified manner by giving examples such as a hypothetical scenario. You will be provided context from the textbook and you have to use this answer the student\'s query. Textbook Context: {context}"
        )
    human_message_prompt = HumanMessagePromptTemplate.from_template(
            "{question}"
        )
    memory = ConversationBufferMemory(memory_key='chat_history',input_key='human_input', return_messages=True)
    chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=faiss_vectordb.as_retriever(),
            memory=memory,
            combine_docs_chain_kwargs={
                "prompt": ChatPromptTemplate.from_messages([
                    system_message_prompt,
                    human_message_prompt,
                ]),
            },
        )
    
    print("now ask question")
    # Let the user know that the system is ready
    msg.content = f"Processing Completed. You can now ask questions!"
    await msg.update()
    cl.user_session.set("chain", chain)


@cl.on_message
async def main(message: cl.Message):
    # chain = cl.user_session.get("chain")  # type: ConversationalRetrievalChain
    # cb = cl.AsyncLangchainCallbackHandler()

    # res = await chain.acall(message.content, callbacks=[cb])
    # answer = res["answer"]
    # source_documents = res["source_documents"]  # type: List[Document]

    # text_elements = []  # type: List[cl.Text]

    # if source_documents:
    #     for source_idx, source_doc in enumerate(source_documents):
    #         source_name = f"source_{source_idx}"
    #         # Create the text element referenced in the message
    #         text_elements.append(
    #             cl.Text(content=source_doc.page_content, name=source_name)
    #         )
    #     source_names = [text_el.name for text_el in text_elements]

    #     if source_names:
    #         answer += f"\nSources: {', '.join(source_names)}"
    #     else:
    #         answer += "\nNo sources found"

    # await cl.Message(content=answer, elements=text_elements).send()
    faiss_vectordb = FAISS.load_local('faiss_index',EMBEDDINGS)
    trans_query = message.content
    print("Translated Query", trans_query)
    textbook_context = faiss_vectordb.similarity_search(message.content)
    chain = cl.user_session.get("chain")  # type: ConversationalRetrievalChain
    res = await chain.arun(question= trans_query, textbook_context = textbook_context, human_input='')
    print("Chatbot Response", res)
    trans_output = res

    await cl.Message(content=trans_output).send()