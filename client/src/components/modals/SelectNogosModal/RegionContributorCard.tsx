import React from 'react';
import {
  Avatar,
  Group,
  Paper,
  Stack,
  Text,
  Collapse,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconInfoCircle } from '@tabler/icons-react';
import { ContributorProfile, Name, UserRole } from 'types';

export const RegionContributorCard: React.FC<{
  contributor: {
    _id: string;
    name: Name;
    role: UserRole;
    contributorProfile?: ContributorProfile;
  };
}> = ({ contributor }) => {
  const [showBio, { toggle: toggleShowBio }] = useDisclosure();

  return (
    <Paper shadow='xs' p='xs' radius='md' bg='white'>
      {contributor.contributorProfile ? (
        <Stack spacing='xs'>
          <Group position='left' noWrap>
            <Avatar
              radius='xl'
              size='lg'
              src={`/images/contributors/${contributor.contributorProfile.imageFilename}`}
            />
            <Stack spacing={0}>
              <Text>
                {contributor.name.first + ' ' + contributor.name.last}
              </Text>
              <Text size='sm' color='dimmed'>
                {contributor.contributorProfile.title}
              </Text>
            </Stack>
            <ActionIcon onClick={toggleShowBio} variant='transparent' size='lg'>
              <IconInfoCircle size='1.625rem' />
            </ActionIcon>
          </Group>
          <Collapse in={showBio}>
            <Text size='xs' color='dimmed'>
              {contributor.contributorProfile.bio}
            </Text>
          </Collapse>
        </Stack>
      ) : (
        <Group position='left'>
          <Avatar radius='xl' size='lg' />
          <Text>{contributor.name.first + ' ' + contributor.name.last}</Text>
        </Group>
      )}
    </Paper>
  );
};
