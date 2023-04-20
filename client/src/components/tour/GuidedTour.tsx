import React, { useState } from 'react';
import Joyride, {
  ACTIONS,
  CallBackProps,
  STATUS,
  Step,
  TooltipRenderProps,
} from 'react-joyride';
import {
  Paper,
  Title,
  Text,
  useMantineTheme,
  Group,
  Button,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';

export const GuidedTour: React.FC = () => {
  const { isMobileSize, showTour, setShowTour } = useGlobalContext();
  const theme = useMantineTheme();
  const [key, setKey] = useState(0);
  const [steps] = useState<Step[]>([
    {
      target: '.waypoints',
      title: 'Choose your waypoints',
      content:
        'You can search for your destinations from the sidebar, or select points directly on the map.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.avoid-nogos',
      title: 'Avoid nogos',
      content:
        'Select this option to avoid unsafe and high-traffic roads, contributed by knowledgable cyclists. Only available in select regions.',
      placement: 'right',
    },
    {
      target: '.comfort-level',
      title: 'Comfort settings',
      content:
        'Choose a comfort level based on your preferences and risk-tolerance. You can also select the shortest route avilable or customize your preferences directly.',
      placement: 'right',
    },
    {
      target: '.additional-preferences',
      title: 'Other options',
      content:
        'Here you can specify your surface preference, paved or unpaved. You can also choose to display alternate routes alongside the recommended option.',
      placement: 'right',
    },
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    if (
      data.action === ACTIONS.CLOSE ||
      data.status === STATUS.FINISHED ||
      data.status === STATUS.SKIPPED
    ) {
      setShowTour(false);
      setKey(key + 1);
    }
  };

  return isMobileSize ? null : (
    <Joyride
      key={key}
      steps={steps}
      run={showTour}
      hideCloseButton
      continuous
      showProgress
      showSkipButton
      styles={{
        options: { zIndex: 99999999999, primaryColor: theme.colors.blue[6] },
      }}
      callback={handleJoyrideCallback}
      tooltipComponent={Tooltip}
    />
  );
};

const Tooltip: (data: TooltipRenderProps) => JSX.Element = ({
  index,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}) => (
  <Paper
    {...tooltipProps}
    shadow='sm'
    radius='md'
    p='md'
    style={{ width: 380, maxWidth: '100%' }}
  >
    {step.title && (
      <Title order={4} align='center'>
        {step.title}
      </Title>
    )}
    <Text p='md'>{step.content}</Text>
    <Group position='apart' align='center'>
      <Button {...closeProps} size='sm' p='xs' variant='subtle' color='gray'>
        Close
      </Button>
      <Group position='right' align='center' spacing='xs'>
        {index > 0 && (
          <Button {...backProps} size='sm' p='xs' variant='subtle'>
            Back
          </Button>
        )}
        <Button {...primaryProps} size='sm' p='xs'>
          {isLastStep ? 'Finish' : `Next (${index + 1}/${size})`}
        </Button>
      </Group>
    </Group>
  </Paper>
);
