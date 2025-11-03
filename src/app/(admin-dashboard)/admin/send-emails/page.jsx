'use client';
import { Post } from '@/Axios/AxiosFunctions';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import { Form, message, Upload } from 'antd';
import { lazy, useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import 'react-quill/dist/quill.snow.css';
import { useSelector } from 'react-redux';
import { read, utils } from 'xlsx';
const { Dragger } = Upload;
const csvFile = '/demo-email-file.xlsx';
const ReactQuill = lazy(() => import('react-quill'));

export default function SendEmail() {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoad, setIsFormLoad] = useState(false);

  const onFileChange = ({ file, fileList }) => {
    const xlsxRegex =
      file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!xlsxRegex) {
      return message.error('Only XLSX file is allowed!');
    } else {
      setFileList(fileList);
    }

    if (file.status === 'removed') {
      setFileList([]);
    }
  };

  const onFinish = async (values) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // get the first sheet
      const worksheet = workbook.Sheets[sheetName];
      const json = utils.sheet_to_json(worksheet, { defval: '' }); // defval avoids undefined cells
      const keys = Object.keys(json?.[0] || {}).map((key) => key.toLowerCase());
      // Validation first, quick exit
      if (!keys.includes('name') || !keys.includes('email')) {
        return CustomToast(
          'error',
          'Please upload a file with Name and Email columns!'
        );
      }
      if (!json?.length) {
        return CustomToast('error', 'No data found in the uploaded file!');
      }
      // Prepare once outside loop
      const [firstKey, secondKey] = Object.keys(json[0]);
      const firstKeyLower = firstKey?.toLowerCase();
      const secondKeyLower = secondKey?.toLowerCase();
      const newJSON = json.map((row) => ({
        [firstKeyLower]: row[firstKey],
        [secondKeyLower]: row[secondKey],
        html: values?.html,
        subject: values?.subject,
      }));
      setIsLoading(true);
      const response = await Post(
        BaseURL('email/send-promotional-email'),
        {
          data: newJSON,
        },
        apiHeader(accessToken)
      );
      setIsLoading(false);
      if (response) {
        CustomToast({ type: 'success', message: 'Email sent successfully!' });
        setFileList([]);
        form.resetFields();
      }
    };
    reader.readAsArrayBuffer(fileList?.[0]?.originFileObj);
  };

  const onFinishFailed = (errorInfo) => {
    console.error('Form submission failed: ', errorInfo);
  };

  const handleDownloadFile = () => {
    const link = document.createElement('a');
    link.href = csvFile;
    link.download = 'promotional-emails.xlsx';
    link.click();
  };
  useEffect(() => {
    setIsFormLoad(true);
  }, []);

  return (
    <>
      <div className='px-[40px]  pt-8 h-[calc(100vh-80px)] overflow-y-auto'>
        <Button className={'ms-auto block'} onClick={handleDownloadFile}>
          Download Demo File
        </Button>

        {isFormLoad ? (
          <Form
            form={form}
            name='xlsx-upload'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{ file: fileList }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
            className='send-email-form'
          >
            <Form.Item
              name='subject'
              label={'Subject'}
              rules={[
                {
                  required: true,
                  message: 'Please enter subject!',
                },
              ]}
            >
              <Input placeholder='Enter your subject here' />
            </Form.Item>
            <Form.Item
              name='html'
              label='Email Content'
              rules={[
                {
                  required: true,
                  message: 'Please add email content!',
                },
              ]}
            >
              <ReactQuill
                theme='snow'
                className='
            rounded-[8px]
            '
              />
            </Form.Item>

            <Form.Item
              name='file'
              rules={[
                {
                  required: true,
                  message: 'Please upload your file!',
                },
                {
                  validator: (_, value) => {
                    if (
                      value?.status == 'removed' ||
                      value?.fileList?.length < 1
                    ) {
                      return Promise.reject(
                        new Error('Please upload your file!')
                      );
                    }

                    const isXlsx = (fileList ?? value?.fileList).every((file) =>
                      /\.xlsx$/i.test(file.name)
                    );
                    return isXlsx
                      ? Promise.resolve()
                      : Promise.reject(new Error('Only XLSX file is allowed!'));
                  },
                },
              ]}
            >
              <Dragger
                accept='.xlsx'
                fileList={fileList}
                beforeUpload={() => false} // Prevent automatic upload
                onChange={onFileChange}
                onRemove={() => setFileList([])} // Clear fileList when a file is removed
                maxCount={1}
                previewFile={fileList}
                className='bg-[var(--input-bg-color)]'
              >
                <p className='ant-upload-drag-icon flex justify-center'>
                  <FaCloudUploadAlt size={70} color='var(--blue-color)' />
                </p>
                <p className='ant-upload-text '>
                  Click or drag file to this area to upload
                </p>
                <p className='ant-upload-hint '>
                  Support for a single upload. File must be in XLSX format.
                </p>
              </Dragger>
            </Form.Item>

            <Form.Item className='text-center'>
              <Button type='primary' htmlType='submit'>
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}
