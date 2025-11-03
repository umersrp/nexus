'use client';
import { useMemo, useState } from 'react';
import Input from '@/components/Input';
import { Button, Table, Space, Modal, Form, Input as AntInput, Upload, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import classes from './tutorials.module.css';

const initRows = [
  { id: '1', title: 'How to take the session', uploadedBy: 'Anna Joe', lastEditedBy: 'Anna Joe', url: '', playBeforeStart: true, skippable: true },
];

export default function TutorialsPage() {
  const [rows, setRows] = useState(initRows);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const filtered = useMemo(() => rows.filter(r => r.title.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  const columns = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Uploaded by', dataIndex: 'uploadedBy' },
    { title: 'Last Edited by', dataIndex: 'lastEditedBy' },
    {
      title: 'Action',
      render: (_, r) => (
        <Space>
          <Button className={classes.iconBtn} onClick={() => onEdit(r)}>Edit</Button>
          <Button className={classes.iconBtn} danger onClick={() => onDelete(r.id)}>Delete</Button>
        </Space>
      )
    }
  ];

  const onDelete = (id) => setRows(prev => prev.filter(r => r.id !== id));

  const onEdit = (row) => {
    setEditing(row);
    setOpen(true);
    form.setFieldsValue({
      title: row.title,
      playBeforeStart: row.playBeforeStart,
      skippable: row.skippable,
    });
  };

  const onCreate = () => {
    setEditing(null);
    setOpen(true);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (editing) {
        setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...values, lastEditedBy: 'Admin' } : r));
      } else {
        setRows(prev => [{ id: Date.now().toString(), uploadedBy: 'Admin', lastEditedBy: 'Admin', url: '', ...values }, ...prev]);
      }
      setOpen(false);
    });
  };

  return (
    <>
      <div className={classes.page}>
        <div className={classes.headerCard}>
          <Input type='text' placeholder='Search user name or email or ID' value={search} setter={setSearch} inputContainerClass={classes.inputPlain} />
          <Button className={classes.createBtn} onClick={onCreate}>+ Add new tutorial</Button>
        </div>
        <Table className={classes.table} rowKey='id' columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} />

        <Modal open={open} onCancel={() => setOpen(false)} title={null} footer={null} centered width={620} bodyStyle={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
          <div className={classes.modalHeader}>Tutorial</div>
          <div className={classes.modalBody}>
            <Form form={form} layout='vertical'>
              <Form.Item label='Tutorial Title' name='title' rules={[{ required: true, message: 'Title is required' }]}>
                <AntInput placeholder='Enter tutorial title' />
              </Form.Item>
              <div className={classes.toggleRow}>
                <span>Play before user starts a session</span>
                <Form.Item name='playBeforeStart' valuePropName='checked' noStyle>
                  <Switch />
                </Form.Item>
              </div>
              <div className={classes.toggleRow}>
                <span>Give users an option to skip the tutorial</span>
                <Form.Item name='skippable' valuePropName='checked' noStyle>
                  <Switch />
                </Form.Item>
              </div>
              <Form.Item label='Upload Tutorial (mp4)'>
                <Upload.Dragger name='file' multiple={false} accept='video/mp4' beforeUpload={() => false}>
                  <p className='ant-upload-drag-icon'><UploadOutlined /></p>
                  <p className='ant-upload-text'>Click or drag file (mp4 format) to this area to upload a tutorial</p>
                </Upload.Dragger>
              </Form.Item>
              <div className={classes.modalFooter}>
                <Button onClick={() => setOpen(false)} className={classes.cancelBtn}>Cancel</Button>
                <Button type='primary' onClick={handleSave} className={classes.saveBtn}>Save</Button>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    </>
  );
}


