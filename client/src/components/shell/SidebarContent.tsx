import React, { useEffect, useState } from 'react';
import { Divider } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import { NogoGroup } from 'models';
import { NogoGroupApi } from 'api';
import { useGlobalContext } from 'contexts/globalContext';
import { AppliedNogos } from './content/AppliedNogos';
import { PublicNogos } from './content/PublicNogos';
import { RoutePreferences } from './content/RoutePreferences';
import { UserNogoGroups } from './content/UserNogoGroups';
import { WaypointsList } from './content/WaypointsList';

export const SidebarContent: React.FC = () => {
  const { loggedInUser, editingNogoGroup, setEditingNogoGroup } =
    useGlobalContext();

  const [userNogoGroups, setUserNogoGroups] = useState<NogoGroup[]>([]);
  const [allPublicNogoGroups, setAllPublicNogoGroups] = useState<NogoGroup[]>(
    []
  );

  useEffect(() => {
    refreshData();
  }, [loggedInUser]);

  const refreshData = async () => {
    try {
      setAllPublicNogoGroups(await NogoGroupApi.getAllPublic());
      const fetchedUserNogoGroups = await NogoGroupApi.getAllForUser();
      setUserNogoGroups(fetchedUserNogoGroups);
      const editingNogoGroupWasDeleted = !fetchedUserNogoGroups.some(
        (nogoGroup) => nogoGroup._id === editingNogoGroup?._id
      );
      if (editingNogoGroupWasDeleted) {
        setEditingNogoGroup(null);
      }
    } catch (error: any) {
      if (error.message === 'User is not logged in') {
        setUserNogoGroups([]);
        return;
      }
      showNotification({
        title: 'Error fetching Nogo Group data',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <>
      <WaypointsList />
      <Divider my='sm' />
      <RoutePreferences />
      <Divider my='sm' />
      <AppliedNogos
        allPublicNogoGroups={allPublicNogoGroups}
        userNogoGroups={userNogoGroups}
      />
      <Divider my='sm' />
      <PublicNogos allPublicNogoGroups={allPublicNogoGroups} />
      <Divider my='sm' />
      <UserNogoGroups
        userNogoGroups={userNogoGroups}
        refreshData={refreshData}
      />
    </>
  );
};
