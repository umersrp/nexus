import LabelAndValue from '@/components/LabelAndValue';
import { Col, Row } from 'antd';
import ModalSkeleton from '../ModalSkeleton';
import classes from './ViewUserModal.module.css';

const ViewEmailContentModal = ({ show, onClose, onClick, loading, data }) => {
  const keyValues = [
    { title: 'Name', valueKey: 'name', col: { md: 24 } },
    {
      title: 'Email',
      valueKey: 'email',
      col: { md: 24 },
    },
    {
      title: 'Subject',
      valueKey: 'subject',
      col: { md: 24 },
    },
    {
      title: 'Body',
      valueKey: 'html',
      col: { md: 24 },
      render: (text) => {
        return <div dangerouslySetInnerHTML={{ __html: text }} />;
      },
    },
  ];
  return (
    <>
      <ModalSkeleton
        header={`Email Content Details`}
        show={show}
        setShow={onClose}
      >
        <Row className={` ${classes.mainDiv}`} gutter={[16, 16]}>
          {keyValues?.map((item, index) => (
            <Col {...item?.col} key={index}>
              <LabelAndValue
                label={item?.title}
                key={index}
                value={
                  item?.render
                    ? item?.render(data?.[item?.valueKey])
                    : data?.[item?.valueKey] ?? '---'
                }
              />
            </Col>
          ))}
        </Row>
      </ModalSkeleton>
    </>
  );
};

export default ViewEmailContentModal;
