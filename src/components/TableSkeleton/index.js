import { Skeleton } from 'antd';

function TableSkeleton({ rowsCount = 10, colsCount = 5 }) {
  const rows = Array(rowsCount).fill(0);
  const cols = Array(colsCount).fill(0);

  return (
    <>
      <style>{`
           .tr{
                all:unset;
                display:flex;
                margin:10px 30px 0px 30px;
            }
            .table100{
                padding-top:30px;
            }
            `}</style>
      <div class='table100 ver1 m-b-110'>
        <div class=' js-pscroll ps ps--active-y'>
          <table>
            <tbody>
              {rows.map((item, index) => (
                <tr class='row100 body tr' key={index}>
                  {cols?.map((_, i) => (
                    <td
                      style={{
                        width: `${100 / colsCount}%`,
                        paddingBlock: '0px',
                      }}
                      key={i}
                    >
                      <Skeleton paragraph height={'70px'} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default TableSkeleton;
