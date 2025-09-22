"use client";
import Pagination from "@mui/material/Pagination";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PaginationComponent = ({
  totalPages,
  currentPage = 1,
  setCurrentPage,
  path,
}) => {
  const [page, setPage] = useState(currentPage);
  const router = useRouter();
  const handleChange = (event, value) => {
    setPage(value);
    if (path && router) {
      const existingPageParam = path.match(/[?&]page=([^&]*)/);
      const newPageParam = `page=${value}`;

      let newPath;

      if (existingPageParam) {
        newPath = path.replace(/([?&])page=[^&]*/, `$1${newPageParam}`);
      } else {
        newPath = path.includes("?")
          ? `${path}&${newPageParam}`
          : `${path}?${newPageParam}`;
      }

      return router?.push(`${newPath}`);
    }
    setCurrentPage(value);
  };

  useEffect(() => {
    setPage(Number(currentPage));
  }, [currentPage]);

  return (
    <>
      <style>{`
        .MuiPagination-ul li .Mui-selected {
            background: var(--primary-color) !important;
            color: var(--text-black-color) !important;
            font-size:16px !important;
            min-width: 28px !important;
            height: 28px !important;
        }
        
    `}</style>
      <div>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChange}
          shape="rounded"
        />
      </div>
    </>
  );
};

export default PaginationComponent;
