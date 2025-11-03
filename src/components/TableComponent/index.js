import React from 'react';
import { Table } from 'antd';
import { recordsLimit } from '@/config/apiUrl';
import './TableComponent.css'; 
const TableComponent = ({
  data = [],
  columns,
  isLoading,
  totalPages,
  page,
  onPageChange = () => null,
  className = '',
  ...props
}) => {
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={isLoading}
      pagination={
        page || totalPages
          ? {
              pageSize: recordsLimit,
              current: page,
              total: totalPages,
            }
          : false
      }
      scroll={{
        y: 'calc(100vh - 300px)',
        x: true,
        scrollToFirstRowOnChange: true,
      }}
      className={`custom-table ${!data?.length ? 'noDataTable' : ''} ${className}`}
      onChange={(e) => {
        onPageChange(e?.current);
      }}
      {...props}
    />
  );
};

export default TableComponent;