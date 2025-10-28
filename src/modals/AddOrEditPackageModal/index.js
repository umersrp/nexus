import Button from '@/components/Button';
import Input from '@/components/Input';
import { Col, Row, Checkbox, Select } from 'antd';
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import ModalSkeleton from '../ModalSkeleton';
import classes from './AddOrEditPackageModal.module.css';

const AddOrEditPackageModal = ({ show, onClose, onClick, loading, data }) => {
  const [name, setName] = useState(data?.name ?? 'basic');
  const [displayName, setDisplayName] = useState(data?.displayName ?? '');
  const [description, setDescription] = useState(
    Array.isArray(data?.description) ? data?.description : [data?.description ?? '']
  );
  const [monthly, setMonthly] = useState(data?.price?.monthly ?? '');
  const [yearly, setYearly] = useState(data?.price?.yearly ?? '');
  const [currency, setCurrency] = useState(data?.price?.currency ?? 'USD');
  const [trialPeriodDays, setTrialPeriodDays] = useState(data?.trialPeriodDays ?? 14);
  const [isActive, setIsActive] = useState(data?.isActive ?? true);

  const HandleSubmit = () => {
    if (!name || !displayName || !monthly || !yearly || !currency) {
      return toast.error('Please fill name, display name, prices and currency');
    }
    const payload = {
      name,
      displayName,
      description: description?.filter(Boolean),
      price: {
        monthly: Number(monthly),
        yearly: Number(yearly),
        currency,
      },
      trialPeriodDays: Number(trialPeriodDays) || 0,
      isActive: Boolean(isActive),
    };
    onClick(payload);
  };

  return (
    <>
      <ModalSkeleton
        header={`${data != undefined ? `Edit ${data?.name}` : 'Add'} ${'Plan'}`}
        show={show}
        setShow={onClose}
        headerStyles={{ background: '#1E3A8A' }}
      >
        <Row gutter={[16, 16]} className={` ${classes.mainDiv}`}>
          <Col md={12} xs={24}>
            <label className='text-[var(--text-black-color)] dark:text-white'>Plan Key</label>
            <Select
              value={name}
              onChange={setName}
              options={[
                { value: 'basic', label: 'basic' },
                { value: 'plus', label: 'plus' },
                { value: 'premium', label: 'premium' },
              ]}
              className='w-full'
            />
          </Col>
          <Col md={12} xs={24}>
            <Input
              type={'text'}
              placeholder={`Enter Display Name`}
              label={`Display Name`}
              value={displayName}
              setter={setDisplayName}
              labelClassName={'!text-[var(--text-black-color)] dark:!text-white'}
              inputContainerClass={'input-plain'}
            />
          </Col>

          <Col md={12} xs={24}>
            <Input
              type={'number'}
              placeholder={`Monthly Price`}
              label={`Monthly Price`}
              value={monthly}
              setter={setMonthly}
              labelClassName={'!text-[var(--text-black-color)] dark:!text-white'}
              inputContainerClass={'input-plain'}
            />
          </Col>
          <Col md={12} xs={24}>
            <Input
              type={'number'}
              placeholder={`Yearly Price`}
              label={`Yearly Price`}
              value={yearly}
              setter={setYearly}
              labelClassName={'!text-[var(--text-black-color)] dark:!text-white'}
              inputContainerClass={'input-plain'}
            />
          </Col>
          <Col md={12} xs={24}>
            <label className='text-[var(--text-black-color)] dark:text-white'>Currency</label>
            <Select
              value={currency}
              onChange={setCurrency}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
              ]}
              className='w-full'
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
          <Col md={12} xs={24}>
            <Input
              type={'number'}
              placeholder={`Trial days`}
              label={`Trial Period Days`}
              value={trialPeriodDays}
              setter={setTrialPeriodDays}
              labelClassName={'!text-[var(--text-black-color)] dark:!text-white'}
              inputContainerClass={'input-plain'}
            />
          </Col>
          <Col md={12} xs={24} className='flex items-end'>
            <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)}>Active</Checkbox>
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
