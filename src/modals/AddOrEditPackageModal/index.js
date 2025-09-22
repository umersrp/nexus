import Button from '@/components/Button';
import Input from '@/components/Input';
import { Col, Row } from 'antd';
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import ModalSkeleton from '../ModalSkeleton';
import classes from './AddOrEditPackageModal.module.css';

const AddOrEditPackageModal = ({ show, onClose, onClick, loading, data }) => {
  const [name, setName] = useState(data?.name ?? '');
  const [description, setDescription] = useState(data?.description ?? [null]);

  const HandleSubmit = () => {
    const params = {
      name,
      description,
    };
    for (let key in params) {
      if (
        Array.isArray(params[key])
          ? params[key].some((e) => !e) || params[key].length == 0
          : !params[key]
      ) {
        return toast.error('Please fill all the fields');
      }
    }

    onClick(params);
  };

  return (
    <>
      <ModalSkeleton
        header={`${data != undefined ? `Edit ${data?.name}` : 'Add'} ${'Plan'}`}
        show={show}
        setShow={onClose}
      >
        <Row gutter={[16, 16]} className={` ${classes.mainDiv}`}>
          <Col md={24}>
            <Input
              type={'text'}
              placeholder={`Enter Name`}
              label={`Name`}
              value={name}
              setter={setName}
              labelClassName={
                '!text-[var(--text-black-color)] dark:!text-white'
              }
            />
          </Col>
          <Col md={24}>
            <Input
              type={'text'}
              placeholder={`Enter Price`}
              label={`Price`}
              value={data?.price}
              disabled={true}
              labelClassName={
                '!text-[var(--text-black-color)] dark:!text-white'
              }
            />
          </Col>

          <Col md={24}>
            <div className='flex justify-between '>
              <label className='text-[var(--text-black-color)] dark:text-white'>
                Description
              </label>
              <Button
                onClick={() => {
                  if (description?.length < 10) {
                    setDescription((prev) => [...prev, null]);
                  } else {
                    return toast.error('You can add maximum 10 descriptions');
                  }
                }}
                variant='primary-outline'
              >
                Add More
              </Button>
            </div>
            {description?.map((e, i) => (
              <div className='mt-2 flex gap-2' key={i}>
                <Input
                  type={'text'}
                  placeholder={`Enter Description ${i + 1}`}
                  value={e}
                  setter={(e) => {
                    const arr = [...description];
                    arr[i] = e;
                    setDescription(arr);
                  }}
                  labelColor={'var(--text-black-color)'}
                />
                <Button
                  onClick={() => {
                    const arr = [...description];
                    arr.splice(i, 1);
                    setDescription(arr);
                  }}
                  className={classes.removeBtn}
                  variant='secondary'
                >
                  <IoClose size={25} />
                </Button>
              </div>
            ))}
          </Col>
          <Col md={24} className={classes?.btnContainer}>
            <Button
              className={classes.submitBtn}
              label={loading ? 'Submitting..' : 'Submit'}
              onClick={HandleSubmit}
              disabled={loading}
            />
          </Col>
        </Row>
      </ModalSkeleton>
    </>
  );
};

export default AddOrEditPackageModal;
