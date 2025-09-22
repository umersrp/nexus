import { Line, Column } from '@ant-design/plots';
import React from 'react';
import { useSelector } from 'react-redux';

const UserGraph = ({
  values,
  yField = 'users',
  type = 'line',
  title = 'Users',
}) => {
  const { theme } = useSelector((state) => state.commonReducer);
  const data = [...values];
  const config = {
    data,
    xField: 'month',
    yField: yField,
    ...(type == 'line'
      ? {
          point: {
            shapeField: 'square',
            sizeField: 4,
          },
        }
      : {}),
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 1,
    },
    axis: {
      x: { labelFill: theme == 'light' ? 'black' : 'white' },
      y: { labelFill: theme == 'light' ? 'black' : 'white' },
    },
  };
  const Graph = type == 'line' ? Line : Column;
  return (
    <div
      className='px-3 py-5 shadow-[#24234254] shadow rounded-[20px] dark:!bg-[var(--table-bg-color)]
    dark:text-white'
    >
      <h5 className=' text-[var(--primary-color)]'>{title}</h5>
      <p className='mb-5 '>This year</p>
      <Graph {...config} height={300} />
    </div>
  );
};

export default UserGraph;
