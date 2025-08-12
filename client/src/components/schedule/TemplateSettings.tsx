import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Divider
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';

interface TemplateSettingsProps {
  onSave?: (settings: any) => void;
}

const TemplateSettings: React.FC<TemplateSettingsProps> = ({ onSave }) => {
  const [settings, setSettings] = useState({
    startTime: '08:00',
    endTime: '22:00',
    timeSlotDuration: 50,
    breakDuration: 10,
    showWeekends: false,
    defaultSemester: '2024-1',
    autoSave: true
  });

  const handleInputChange = (field: string) => (event: any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    // 这里可以添加保存到本地存储或服务器的逻辑
    localStorage.setItem('scheduleSettings', JSON.stringify(settings));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          课表模板设置
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 时间设置 */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            时间设置
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="开始时间"
              type="time"
              value={settings.startTime}
              onChange={handleInputChange('startTime')}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="结束时间"
              type="time"
              value={settings.endTime}
              onChange={handleInputChange('endTime')}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Divider />

        {/* 课程设置 */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            课程设置
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="课程时长（分钟）"
              type="number"
              value={settings.timeSlotDuration}
              onChange={handleInputChange('timeSlotDuration')}
              inputProps={{ min: 30, max: 120, step: 5 }}
            />
            <TextField
              label="课间休息（分钟）"
              type="number"
              value={settings.breakDuration}
              onChange={handleInputChange('breakDuration')}
              inputProps={{ min: 5, max: 30, step: 5 }}
            />
          </Box>
        </Box>

        <Divider />

        {/* 显示设置 */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            显示设置
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showWeekends}
                onChange={handleInputChange('showWeekends')}
              />
            }
            label="显示周末"
          />
        </Box>

        <Divider />

        {/* 默认设置 */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            默认设置
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            <TextField
              label="默认学期"
              value={settings.defaultSemester}
              onChange={handleInputChange('defaultSemester')}
              placeholder="例如：2024-1"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={handleInputChange('autoSave')}
                />
              }
              label="自动保存"
            />
          </Box>
        </Box>

        {/* 保存按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            保存设置
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TemplateSettings;