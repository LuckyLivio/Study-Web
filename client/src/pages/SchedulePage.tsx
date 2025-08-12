import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import SchedulePageComponent from '../components/schedule/SchedulePage';

const SchedulePage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarDaysIcon style={{ width: 32, height: 32, marginRight: 12, color: '#1976d2' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            我的课表管理系统
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
          管理您的课程安排、上传课表文件、自定义颜色主题，并为每门课程添加评价
        </Typography>
      </Box>
      
      <SchedulePageComponent />
    </Container>
  );
};

export default SchedulePage;