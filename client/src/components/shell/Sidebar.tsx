import React, { useState } from 'react';
import {
  Button,
  Group,
  Navbar,
  ScrollArea,
  Image,
  Stack,
  Collapse,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';
import { SidebarHeader } from './SidebarHeader';
import { MapControls } from './MapControls';
import { WaypointsList } from './content/WaypointsList';
import { RoutePreferences } from './content/RoutePreferences';
import {
  IconChevronsDown,
  IconChevronsUp,
  IconDownload,
  IconList,
  IconX,
} from '@tabler/icons-react';
import LogoSvg from 'assets/brand/logo-name.svg';
import { TurnInstructions } from './content/TurnInstructions';
import { FeatureFlags } from 'featureFlags';

export const Sidebar: React.FC = () => {
  const { loggedInUser, isMobileSize, isNavbarOpen, toggleNavbar } =
    useGlobalContext();
  const { routes, selectedRouteIndex, waypoints, clearWaypoints, downloadGPX } =
    useMapContext();
  const [showTurnInstructions, setShowTurnInstructions] = useState(false);

  return (
    <>
      <Navbar
        px='md'
        py='xs'
        hiddenBreakpoint='sm'
        hidden={!isMobileSize && !isNavbarOpen}
        width={{ sm: 400 }}
        height={'fit-content'}
        bottom='unset'
        pos='relative'
        top={0}
        styles={
          isMobileSize
            ? { root: { borderRadius: '0 0 1rem 1rem' } }
            : { root: { borderRadius: '0 0 1rem 0' } }
        }
      >
        {isNavbarOpen && (
          <ScrollArea.Autosize mah='70dvh' type='scroll' mb='xs'>
            <Navbar.Section>
              <SidebarHeader />
            </Navbar.Section>
            <Navbar.Section>
              <>
                <WaypointsList />
                <RoutePreferences />
                <Collapse in={showTurnInstructions}>
                  <TurnInstructions show={showTurnInstructions} />
                </Collapse>
              </>
            </Navbar.Section>
          </ScrollArea.Autosize>
        )}
        <Group position='apart'>
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
              src={LogoSvg}
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
            rightIcon={
              isNavbarOpen ? (
                <IconChevronsUp size='1rem' />
              ) : (
                <IconChevronsDown size='1rem' />
              )
            }
            styles={{
              rightIcon: { marginLeft: '0.25rem' },
            }}
            onClick={toggleNavbar}
          >
            {isNavbarOpen ? 'Hide menu' : 'Show menu'}
          </Button>
        </Group>
      </Navbar>
      <MapControls />
    </>
  );
};
