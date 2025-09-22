"use client";
import React from "react";
import { Box, styled, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import classes from "./CategoryAndProducts.module.css";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function CategoryAndProducts({
  categories = [],
  tabValue,
  tabTextColor = "var(--text-black-color)",
  tabSelectedTextColor = "var(--blue-color)",
}) {
  const router = useRouter();

  function handleChange(e, a) {
    router?.push(`/category/${categories[a]?._id}?page=1`);
  }
  const StyledTab = styled((props) => <Tab {...props} />)(({ theme }) => ({
    textTransform: "capitialize",
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: tabTextColor,
    "&.Mui-selected": {
      color: tabSelectedTextColor,
    },
  }));

  return (
    <section className={classes?.section}>
      <Box sx={{ borderBottom: 1, borderColor: tabTextColor }}>
        <Tabs
          value={categories?.findIndex((e) => tabValue == (e?._id ?? e?.name))}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile="auto"
        >
          {categories?.map((a, i) => (
            <StyledTab key={a?.name} label={a?.name} {...a11yProps(i)} />
          ))}
        </Tabs>
      </Box>
    </section>
  );
}

export default CategoryAndProducts;
