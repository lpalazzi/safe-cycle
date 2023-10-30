import React from 'react';
import { Anchor, Button, Stack, Text, Title } from '@mantine/core';
import { ModalSettings } from '@mantine/modals/lib/context';

const SurveyModalContent: React.FC = () => {
  return (
    <Stack align='center'>
      <Title size='h4'>🚴 We Want Your Input! 🚴</Title>
      <Text>
        At SafeCycle, we're committed to making your biking experience better.
        If you have feedback and ideas for how we can improve, please share your
        thoughts with us by taking a brief survey. Your insights will shape the
        future of SafeCycle. Click the link below to take the survey and help us
        make biking safer and more enjoyable for everyone!
      </Text>
      <Anchor
        href='https://surveys.xyzdigital.com/index.php?r=survey/index&sid=943444&lang=en'
        target='_blank'
        onClick={() => {
          window.localStorage.setItem('surveyClicked', 'true');
        }}
      >
        <Button>Take the Survey</Button>
      </Anchor>
    </Stack>
  );
};

export const SurveyModal: ModalSettings = {
  children: <SurveyModalContent />,
};
