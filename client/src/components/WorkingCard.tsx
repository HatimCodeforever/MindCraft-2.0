import React from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Heading,
    Text,
    Stack,
    Divider,
    ButtonGroup,
    Button,
    Flex,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react';
import { HiAcademicCap } from 'react-icons/hi';
import { TfiArrowTopRight } from 'react-icons/tfi';
import { useNavigate } from 'react-router-dom';
import { MdPause } from 'react-icons/md';
import { Stepper } from 'react-form-stepper';

interface CardProps {
    title: string;
    content: string;
}
const stepperStyle = {
    "& .active-step": {
       color: 'purple', // Change 'purple' to the desired color for active step
    },
    "& .completed-step": {
       color: 'purple', // Change 'purple' to the desired color for completed step
    },
    "& .inactive-step": {
       color: 'lightgray', // Change 'lightgray' to the desired color for inactive step
    },
   };

const WorkingCard: React.FC<CardProps> = ({ title, content, chaptersCompleted, totalChapters, activeSteps }) => {
    const navigate = useNavigate();
    const handleResumeLearning = () => {
        // Save title to localStorage
    };

    return (
        <Card
            boxShadow="dark-lg"
            width="300px"
            mt={8}
            mr={4}
            ml={4}
            bg={useColorModeValue('purple.200', 'purple.800')}
        >
            <CardHeader>
                <Flex justify="center" align="center">
                    <HiAcademicCap size={48} />
                </Flex>
            </CardHeader>
            <CardBody>
                <Stack spacing="3">
                    <Text className='feature-heading' fontSize={"lg"} textAlign={'center'}><b>{title}</b></Text>
                    <Text className='content' textAlign={"justify"} >{content as string}</Text>
                </Stack>
            </CardBody>
            <Divider/>
            <Stepper
            steps={[{ label: 'Quiz 1' }, { label: 'Quiz 2' }, { label: 'Quiz 3' }]}
            activeStep={activeSteps}
            styleConfig={{
                activeBgColor: '#527853', // Background color of the active step
                completedBgColor: '#527853', // Background color of the completed step
                inactiveBgColor: '#D04848', // Background color of the inactive step
                activeTextColor: 'white', // Text color of the active step
                completedTextColor: 'white', // Text color of the completed step
                inactiveTextColor: 'white', // Text color of the inactive step
             }}
        />
            <Flex justify="center" align="center">
                <CardFooter>
                    <ButtonGroup spacing="2">
                        <Button bg={'purple.500'} textColor={'white'} _hover={{ bg: useColorModeValue('purple.800', 'purple.800'), color: useColorModeValue('white', 'white'), transform: "scale(1.05)" }} variant="outline" onClick={handleResumeLearning} size={'md'}>
                            Continue Learning
                            <svg width="20" height="20" style={{ margin: '8px' }}>
                                <polygon points="10,0 0,20 20,20" fill="white" transform="rotate(90 10 10)" />
                            </svg>
                        </Button>
                    </ButtonGroup>
                </CardFooter>
            </Flex>
        </Card>
    );
};

export default WorkingCard;