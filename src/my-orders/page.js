"use client";
import { Get } from "@/Axios/AxiosFunctions";
import IconBtn from "@/components/IconBtn";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData/NoData";
import TableSkeleton from "@/components/TableSkeleton";
import { BaseURL } from "@/config/apiUrl";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { AiFillEye } from "react-icons/ai";
import { useSelector } from "react-redux";
import classes from "./myOrders.module.css";

function MyOrders() {
  const router = useRouter();
  const { accessToken } = useSelector((state) => state?.authReducer);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    const url = BaseURL(`orders?status=ALL`);
    setLoading(true);
    const response = await Get(url, accessToken);
    setLoading(false);

    if (response) {
      setData(response?.data?.data?.orders);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Loader completeLoading={loading}>
      <div className={[classes.page].join(" ")}>
        <Container className={classes?.mainContainer}>
          <style>{`
        .table100-body{
          height:calc(100vh - 200px);
        }
                @media screen and (max-width:1200px){
        .table100-head{
          width:1200px;
        }
        .table100-body{
          width:1200px;
        }
        .table100{
          overflow-x:scroll !important;
        }

        `}</style>

          <div className={[classes?.tableDiv].join(" ")}>
            <div class="table100 ver1 m-b-110">
              <div class="table100-head">
                <table>
                  <thead>
                    <tr class="row100 head">
                      <th
                        class="cell100 column1"
                        style={{ width: "10%", textAlign: "left" }}
                      >
                        S.No
                      </th>

                      <th
                        class="cell100 column3"
                        style={{ width: "15%", textAlign: "left" }}
                      >
                        Total Products
                      </th>
                      <th
                        class="cell100 column3"
                        style={{ width: "15%", textAlign: "center" }}
                      >
                        Amount
                      </th>
                      <th
                        class="cell100 column3"
                        style={{ width: "15%", textAlign: "center" }}
                      >
                        Estimated Days
                      </th>
                      <th
                        class="cell100 column3"
                        style={{ width: "10%", textAlign: "center" }}
                      >
                        Progress
                      </th>
                      <th
                        class="cell100 column3"
                        style={{ width: "10%", textAlign: "center" }}
                      >
                        Status
                      </th>
                      <th
                        class="cell100 column3"
                        style={{ width: "15%", textAlign: "left" }}
                      >
                        Created At
                      </th>
                      <th
                        class="cell100 column6"
                        style={{ width: "10%", textAlign: "center" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {loading ? (
                <TableSkeleton rowsCount={6} colsCount={8} />
              ) : (
                <div class="table100-body js-pscroll ps ps--active-y">
                  <table>
                    <tbody>
                      {data?.length > 0 ? (
                        data?.map((item, index) => (
                          <tr class="row100 body" key={item?._id}>
                            <td
                              class="cell100 column1"
                              style={{ width: "10%", textAlign: "left" }}
                            >
                              {index + 1}
                            </td>
                            <td
                              class="cell100 column3"
                              style={{ width: "15%", textAlign: "left" }}
                            >
                              {item?.items?.length}
                            </td>
                            <td
                              class="cell100 column3"
                              style={{ width: "15%", textAlign: "center" }}
                            >
                              {`$${item?.total}`}
                            </td>
                            <td
                              class="cell100 column3"
                              style={{ width: "15%", textAlign: "center" }}
                            >
                              <p className="Line1">{item?.estimateDays}</p>
                            </td>
                            <td
                              class="cell100 column3"
                              style={{ width: "10%", textAlign: "center" }}
                            >
                              <p className="Line1">{item?.progress}%</p>
                            </td>
                            <td
                              class="cell100 column3"
                              style={{ width: "10%", textAlign: "center" }}
                            >
                              <p className="Line1">{item?.status}</p>
                            </td>
                            <td
                              class="cell100 column5"
                              style={{ width: "15%", textAlign: "left" }}
                            >
                              {moment(item?.createdAt).format(
                                "DD MM YYYY hh:mm"
                              )}
                            </td>

                            <td
                              class="cell100 column6"
                              style={{ width: "10%", textAlign: "center" }}
                            >
                              <div className="jCenter">
                                <IconBtn
                                  title="View"
                                  icon={<AiFillEye />}
                                  onClick={() =>
                                    router.push(`/my-orders/${item?._id}`)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="row100 body">
                          <td colSpan={6} className={"w-100"}>
                            <NoData text={"No Orders Found"} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </Loader>
  );
}

export default MyOrders;
