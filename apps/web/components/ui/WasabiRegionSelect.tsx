import { Select } from "@chakra-ui/react";
import React from "react";

const regions = [
  { name: "US East 1 (N. Virginia)", code: "us-east-1" },
  { name: "US East 2 (N. Virginia)", code: "us-east-2" },
  { name: "US Central 1 (Texas)", code: "us-central-1" },
  { name: "US West 1 (Oregon)", code: "us-west-1" },
  { name: "CA Central 1 (Toronto)", code: "ca-central-1" },
  { name: "EU Central 1 (Amsterdam)", code: "eu-central-1" },
  { name: "EU Central 2 (Frankfurt)", code: "eu-central-2" },
  { name: "EU West 1 (London)", code: "eu-west-1" },
  { name: "EU West 2 (Paris)", code: "eu-west-2" },
  { name: "AP Northeast 1 (Tokyo)", code: "ap-northeast-1" },
  { name: "AP Northeast 2 (Osaka)", code: "ap-Northeast-2" },
  { name: "AP Southeast 1 (Singapore)", code: "ap-southeast-1" },
  { name: "AP Southeast 2 (Sydney)", code: "ap-southeast-2" },
];

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const WasabiRegionSelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Select
      placeholder="Select Region"
      variant="flushed"
      value={value}
      onChange={onChange}
      isRequired
    >
      {regions.map((region) => (
        <option key={region.code} value={region.code}>
          {region.name} - {region.code}
        </option>
      ))}
    </Select>
  );
};

export default WasabiRegionSelect;
