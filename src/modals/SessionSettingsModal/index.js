import { useState, useEffect } from 'react';
import { Modal, InputNumber, Switch, Button } from 'antd';

const SessionSettingsModal = ({ open, onClose, onSave, initial }) => {
  const [duration, setDuration] = useState(30);
  const [allowPauseResume, setAllowPauseResume] = useState(true);
  const [allowStop, setAllowStop] = useState(true);

  useEffect(() => {
    if (initial) {
      setDuration(initial.duration ?? 30);
      setAllowPauseResume(!!initial.allowPauseResume);
      setAllowStop(!!initial.allowStop);
    }
  }, [initial, open]);

  const handleSave = () => {
    onSave({ duration, allowPauseResume, allowStop });
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      bodyStyle={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}
    >
      <div style={{ background: '#0b3b7c', color: 'white', padding: '18px 20px' }}>
        <h3 style={{ margin: 0, fontWeight: 700 }}>Session Settings</h3>
      </div>
      <div style={{ padding: 20, background: '#0b3772', color: 'white' }}>
        <div style={{ display: 'grid', rowGap: 18 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600 }}>Session Duration (Minutes)</label>
            <InputNumber
              min={1}
              max={240}
              value={duration}
              onChange={(v) => setDuration(v || 1)}
              controls={false}
              style={{ width: 80, marginTop: 8 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Allow users to Pause/Resume session</span>
            <Switch checked={allowPauseResume} onChange={setAllowPauseResume} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Allow users to stop/quit session</span>
            <Switch checked={allowStop} onChange={setAllowStop} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
          <Button onClick={onClose} style={{ background: '#9c2b24', color: 'white' }}>Cancel</Button>
          <Button type="primary" onClick={handleSave} style={{ background: '#a7d5ff', color: '#083c74', border: 'none' }}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SessionSettingsModal;


