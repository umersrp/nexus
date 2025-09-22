import { Avatar, Badge } from "antd";
import { IoIosCheckmarkCircle } from "react-icons/io";

export default function PreferenceCard({ data, preferences, setPreferences }) {
  return (
    <div
      key={data?.value}
      className={`flex flex-col  items-center
                  cursor-pointer border-2 ${
                    data?.value == preferences?.value
                      ? "border-[var(--primary-color)]"
                      : "border-[var(--input-bg-color)]"
                  }  border-solid bg-[var(--input-bg-color)]
                  rounded-md
                  `}
      onClick={() => setPreferences && setPreferences(data)}
    >
      <Badge
        offset={[-15, 15]}
        count={
          preferences?.value == data?.value ? (
            <IoIosCheckmarkCircle
              style={{
                color: "var(--primary-color)",
              }}
              size={20}
            />
          ) : (
            0
          )
        }
      >
        <Avatar src={`/${data?.image}`} shape="square" size={100} />
      </Badge>
      <span>{data?.label}</span>
    </div>
  );
}
