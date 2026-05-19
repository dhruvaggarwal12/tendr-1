import * as React from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import MovieIcon from '@mui/icons-material/Movie';
import { useNavigate } from 'react-router-dom';
import tendrLogo from '../assets/logos/tendr.png';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const actions = [
  { icon: <TimelineIcon />, name: 'Timeline', path: '/timeline-picker' },
  { icon: <CheckBoxIcon />, name: 'Checklist', path: '/checklist-picker' },
  { icon: <InsertInvitationIcon />, name: 'Invitation Flyers', path: '/invitation' },
  { icon: <MovieIcon />, name: 'Aftermovie', path: '/aftermovie' },
  {icon: <GroupAddIcon/>, name: 'Budget Allocator', path: '/budget-picker' },
];


// Removed from all pages — planning tools accessible via the sidebar nav instead
export default function BasicSpeedDial() {
  return null;
}
