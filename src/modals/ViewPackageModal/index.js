import LabelAndValue from '@/components/LabelAndValue';
import { Col, Row } from 'antd';
import ModalSkeleton from '../ModalSkeleton';
import classes from './ViewUserModal.module.css';

const ViewPackageModal = ({ show, onClose, onClick, loading, data }) => {
  const keyValues = [
    { title: 'Name', valueKey: 'name', col: { md: 12 } },
    {
      title: 'Price',
      valueKey: 'price',
      col: { md: 12 },
      render: (text) => {
        return `€${text}`;
      },
    },
    {
      title: 'Session Duration',
      valueKey: 'duration',
      col: { md: 12 },
      render: (text) => {
        return `${text}Mins`;
      },
    },
    {
      title: 'Description',
      valueKey: 'description',
      col: { md: 24 },
      render: (text) => {
        return (
          <ul className=' mt-3'>
            {text?.map((item, index) => (
              <li className='mb-[2px]' key={index}>
                {`${index + 1}) ${item}`}
              </li>
            ))}
          </ul>
        );
      },
    },
  ];
  return (
    <>
      <ModalSkeleton
        header={`${data?.name} Plan Detail`}
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

export default ViewPackageModal;
