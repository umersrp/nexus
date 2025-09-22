import classes from './ViewUserModal.module.css';
import ModalSkeleton from '../ModalSkeleton';
import LabelAndValue from '@/components/LabelAndValue';
import { Col, Row, Tag } from 'antd';
import {
  areaOfInterestOptions,
  educationOptions,
  genderOptions,
  preferencesOptions,
  professionalBackgroundOptions,
} from '@/constant/commonData';
import PreferenceCard from '@/components/PreferenceCard';

const ViewUserModal = ({ show, onClose, onClick, loading, data }) => {
  return (
    <>
      <ModalSkeleton header={`View User Detail`} show={show} setShow={onClose}>
        <Row className={` ${classes.mainDiv}`} gutter={[16, 16]}>
          <Col md={12}>
            <LabelAndValue
              label={'First Name'}
              value={data?.firstName ?? '---'}
            />
          </Col>
          <Col md={12}>
            <LabelAndValue
              label={'Last Name'}
              value={data?.lastName ?? '---'}
            />
          </Col>

          <Col md={12}>
            <LabelAndValue label={'Email'} value={data?.email} />
          </Col>
          <Col md={12}>
            <LabelAndValue
              label={'Gender'}
              value={
                genderOptions?.find((e) => data?.gender === e?.value)?.label ??
                '---'
              }
            />
          </Col>
          <Col md={12}>
            <LabelAndValue
              label={'Education'}
              value={
                educationOptions?.find((e) => data?.education === e?.value)
                  ?.label ?? '---'
              }
            />
          </Col>
          <Col md={24} sm={24}>
            <LabelAndValue
              label={'Professional Background'}
              value={
                professionalBackgroundOptions?.find(
                  (e) => data?.professionalBackground === e?.value
                )?.label ?? '---'
              }
            />
          </Col>

          <Col md={24} sm={24}>
            <LabelAndValue
              label={'Areas of Interest'}
              value={`${data?.areaOfInterest
                ?.map(
                  (a) =>
                    areaOfInterestOptions?.find((e) => e?.value == a)?.label ??
                    a
                )
                ?.join(', ')}`}
            />
          </Col>
          <Col md={24} sm={24}>
            <LabelAndValue label={'Character Preference'} value={''} />
            <PreferenceCard
              data={preferencesOptions?.find((e) =>
                data?.preferences?.includes(e?.value)
              )}
            />
          </Col>

          <Col md={24} sm={24}>
            <LabelAndValue
              label={'Current Plan'}
              value={
                data?.plan?.name ? (
                  <Tag color='#389e0d'> {data?.plan?.name}</Tag>
                ) : (
                  '---'
                )
              }
            />
          </Col>
        </Row>
      </ModalSkeleton>
    </>
  );
};

export default ViewUserModal;
