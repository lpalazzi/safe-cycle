import React, { useEffect, useMemo, useState } from 'react';
import { Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import {
  IconArrowBack,
  IconArrowBackUp,
  IconArrowBearLeft,
  IconArrowBearLeft2,
  IconArrowBearRight,
  IconArrowBearRight2,
  IconArrowRoundaboutLeft,
  IconArrowRoundaboutRight,
  IconArrowSharpTurnLeft,
  IconArrowSharpTurnRight,
  IconArrowUp,
  IconArrowUpCircle,
  IconCornerUpLeft,
  IconCornerUpRight,
  IconRoadOff,
} from '@tabler/icons-react';
import { useMapContext } from 'contexts/mapContext';
import { metresToDistanceString } from 'utils/formatting';
import { TurnInstruction } from 'models';

export const TurnInstructions: React.FC<{ show: boolean }> = ({ show }) => {
  const { turnInstructions } = useMapContext();
  const [streetsFetched, setStreetsFetched] = useState(0);

  const allStreetsFetched = useMemo(() => {
    return turnInstructions?.every(
      (turnInstruction) => turnInstruction.streetFetched
    );
  }, [streetsFetched, turnInstructions]);

  const handleStreetFetched = () => {
    setStreetsFetched((prev) => prev + 1);
  };

  return show ? (
    turnInstructions ? (
      <>
        <Stack display={allStreetsFetched ? 'flex' : 'none'}>
          {turnInstructions.map((turnInstruction) => (
            <TurnInstructionComponent
              turnInstruction={turnInstruction}
              onStreetFetched={handleStreetFetched}
            />
          ))}
        </Stack>
        {!allStreetsFetched ? (
          <Group position='center'>
            <Loader color='gray' />
            <Title order={6} color='dimmed'>
              Loading turn instructions
            </Title>
          </Group>
        ) : null}
      </>
    ) : (
      <Group position='center'>
        <Title order={6} color='dimmed'>
          No turn instructions available
        </Title>
      </Group>
    )
  ) : null;
};

const TurnInstructionComponent: React.FC<{
  turnInstruction: TurnInstruction;
  onStreetFetched: () => void;
}> = ({ turnInstruction, onStreetFetched }) => {
  const [streetName, setStreetName] = useState<string | null>(null);

  useEffect(() => {
    turnInstruction.getStreetName().then((val) => {
      setStreetName(val);
      onStreetFetched();
    });
  }, [turnInstruction]);

  return (
    <Paper>
      <Group noWrap spacing='md'>
        {TurnIcons[turnInstruction.command]}
        <Stack spacing={0}>
          <Title order={6}>{getTurnString(turnInstruction, streetName)}</Title>
          <Text size='xs' c='dimmed'>
            {metresToDistanceString(turnInstruction.distanceAfter, 1)}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
};

const getTurnString = (
  turnInstruction: TurnInstruction,
  streetName: string | null
) => {
  return {
    [1]: `Continue ${streetName ? `on ${streetName}` : ''}`,
    [2]: `Turn left  ${streetName ? `onto ${streetName}` : ''}`,
    [3]: `Turn slightly left ${streetName ? `onto ${streetName}` : ''}`,
    [4]: `Turn sharply left ${streetName ? `onto ${streetName}` : ''}`,
    [5]: `Turn right ${streetName ? `onto ${streetName}` : ''}`,
    [6]: `Turn slightly right ${streetName ? `onto ${streetName}` : ''}`,
    [7]: `Turn sharply right ${streetName ? `onto ${streetName}` : ''}`,
    [8]: `Keep left ${streetName ? `on ${streetName}` : ''}`,
    [9]: `Keep right ${streetName ? `on ${streetName}` : ''}`,
    [10]: `U-turn ${streetName ? `onto ${streetName}` : ''}`,
    [11]: `U-turn ${streetName ? `onto ${streetName}` : ''}`,
    [12]: `Right U-turn ${streetName ? `onto ${streetName}` : ''}`,
    [13]: 'Off route',
    [14]: `Take roundabout exit ${turnInstruction.roundaboutExit}`,
    [15]: `Take roundabout exit ${turnInstruction.roundaboutExit}`,
    [16]: 'Take beeline path',
  }[turnInstruction.command].trim();
};

const TurnIcons = {
  [1]: <IconArrowUp size={32} />,
  [2]: <IconCornerUpLeft size={32} />,
  [3]: <IconArrowBearLeft size={32} />,
  [4]: <IconArrowSharpTurnLeft size={32} />,
  [5]: <IconCornerUpRight size={32} />,
  [6]: <IconArrowBearRight size={32} />,
  [7]: <IconArrowSharpTurnRight size={32} />,
  [8]: <IconArrowBearLeft2 size={32} />,
  [9]: <IconArrowBearRight2 size={32} />,
  [10]: <IconArrowBackUp size={32} style={{ transform: 'rotate(-90deg)' }} />,
  [11]: <IconArrowBackUp size={32} style={{ transform: 'rotate(-90deg)' }} />,
  [12]: <IconArrowBack size={32} style={{ transform: 'rotate(-90deg)' }} />,
  [13]: <IconRoadOff size={32} />,
  [14]: <IconArrowRoundaboutLeft size={32} />,
  [15]: <IconArrowRoundaboutRight size={32} />,
  [16]: <IconArrowUpCircle size={32} />,
};
