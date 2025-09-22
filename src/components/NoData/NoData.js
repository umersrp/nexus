import classes from "./noData.module.css";
import { ImSearch } from "react-icons/im";

function NoData({ text = "No Data Found", color = "var(--blue-color)" }) {
  return (
    <div className={classes.noDataContainer}>
      <ImSearch size={60} color={color} />
      <p style={{ color }}>{text}</p>
    </div>
  );
}

export default NoData;
