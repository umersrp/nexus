import React from 'react';
import { Table } from 'antd';
import { createStyles } from 'antd-style';
import { recordsLimit } from '@/config/apiUrl';
const useStyle = createStyles(({ css, token }) => {
  const antCls = 'antd';
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body {
            max-height: 500px;
            ${antCls}-table-content {
              scrollbar-width: thin;
              scrollbar-color: #eaeaea transparent;
              scrollbar-gutter: stable;
              box-shadow: 0px 1px 5px #24234254;
            }
          }
        }
      }
    `,
  };
});

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
      className={[!data?.length && 'noDataTable', className].join(' ')}
      onChange={(e) => {
        onPageChange(e?.current);
      }}
      {...props}
    />
  );
};
export default TableComponent;
