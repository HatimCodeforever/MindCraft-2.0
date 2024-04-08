import React from 'react';
import {
  Box, Text, Stack, Heading, Image, Card, CardBody, CardFooter, Button, useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import image1 from '../assets/cards/image1.jpg'
import image2 from '../assets/cards/image2.jpg'
import image3 from '../assets/cards/image3.jpg'
import image4 from '../assets/cards/image4.jpg'
import image5 from '../assets/cards/image5.jpg'
import image6 from '../assets/cards/image6.jpg'
import image7 from '../assets/cards/image7.jpg'
import image8 from '../assets/cards/image8.jpg'
import image9 from '../assets/cards/image9.jpg'
import image10 from '../assets/cards/image10.jpg'

interface CourseCardProps {
  moduleTopic: string;
  moduleSummary: string;
}

const RecommendedCard: React.FC<CourseCardProps> = ({ moduleTopic, moduleSummary }) => {
  const handleResumeLearning = () => {
    // Save title to localStorage
  };

  const images = [image1,image2,image3,image4,image5,image6,image7,image8,image9,image10];

  const randomIndex = Math.floor(Math.random() * images.length);
  const randomImage = images[randomIndex];
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      mb={4}
      boxShadow="md"
      borderRadius="md"
      transition="transform 0.3s ease-in-out"
      _hover={{ transform: 'scale(1.03)' }}
    >
      <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src={randomImage}
        alt='Random Image'
      />

      <Stack>
        <CardBody>
          <Heading size='md'>{moduleTopic}</Heading>

          <Text py='2'>
            {moduleSummary}
          </Text>
        </CardBody>

        <CardFooter>
          <Button bg={'purple.500'} textColor={'white'} _hover={{ bg: useColorModeValue('purple.800', 'purple.800'), color: useColorModeValue('white', 'white'), transform: "scale(1.05)" }} variant="outline" onClick={handleResumeLearning} size={'md'}>
            Get Started
          </Button>
        </CardFooter>
      </Stack>
    </Card>
  );
};

export default RecommendedCard;
