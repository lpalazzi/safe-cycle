import React from 'react';
import { Group, Image, Button } from '@mantine/core';
import {
  IconChevronsDown,
  IconChevronsUp,
  IconDownload,
  IconList,
  IconX,
} from '@tabler/icons-react';

import { FeatureFlags } from 'featureFlags';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';

import LogoName from 'assets/brand/logo-name-smaller.png';

type SidebarFooterProps = {
  setShowTurnInstructions: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  setShowTurnInstructions,
}) => {
  const { loggedInUser, isNavbarOpen, toggleNavbar } = useGlobalContext();
  const { routes, selectedRouteIndex, waypoints, clearWaypoints, downloadGPX } =
    useMapContext();

  return (
    <Group
      position='apart'
      style={isNavbarOpen ? {} : { cursor: 'pointer' }}
      onClick={isNavbarOpen ? undefined : toggleNavbar}
    >
      {isNavbarOpen ? (
        waypoints.length > 0 ? (
          <Group position='left' spacing={0}>
            <Button
              size='xs'
              compact
              variant='subtle'
              color='gray'
              leftIcon={<IconX size={16} />}
              styles={{ leftIcon: { marginRight: 5 } }}
              onClick={() => {
                setShowTurnInstructions(false);
                clearWaypoints();
              }}
            >
              Clear
            </Button>
            {!!routes &&
            (selectedRouteIndex || selectedRouteIndex === 0) &&
            waypoints.length > 1 ? (
              <>
                {FeatureFlags.TurnInstructions.isEnabledForUser(
                  loggedInUser?._id
                ) ? (
                  <Button
                    size='xs'
                    compact
                    variant='subtle'
                    color='gray'
                    leftIcon={<IconList size={16} />}
                    styles={{ leftIcon: { marginRight: 5 } }}
                    onClick={() => setShowTurnInstructions((prev) => !prev)}
                  >
                    Details
                  </Button>
                ) : null}
                <Button
                  size='xs'
                  compact
                  variant='subtle'
                  color='gray'
                  leftIcon={<IconDownload size={16} />}
                  styles={{ leftIcon: { marginRight: 5 } }}
                  onClick={downloadGPX}
                >
                  GPX
                </Button>
              </>
            ) : null}
          </Group>
        ) : (
          <div></div>
        )
      ) : (
        <Image
          src={LogoName}
          height={30}
          width='min(max-content, 100%)'
          fit='contain'
          alt='SafeCycle Logo'
          withPlaceholder
          style={{ flexGrow: 1 }}
          styles={{ image: { width: 'unset' } }}
        />
      )}
      <Button
        size='xs'
        compact
        variant='transparent'
        c='dimmed'
        onClick={toggleNavbar}
      >
        {isNavbarOpen ? (
          <IconChevronsUp size='1rem' />
        ) : (
          <IconChevronsDown size='1rem' />
        )}
      </Button>
    </Group>
  );
};
