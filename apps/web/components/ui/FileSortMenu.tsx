import { IconButton, Button, MenuItem, Menu, MenuList, MenuButton } from "@chakra-ui/react";
import React from "react";
import { FileSortConfig } from "@util/types";
import { ChevronDown, ArrowsSort } from "tabler-icons-react";

const FileSortMenu: React.FC<{
  setFileSort: React.Dispatch<React.SetStateAction<FileSortConfig>>;
  fileSort: FileSortConfig;
}> = ({ fileSort, setFileSort }) => (
  <>
    <Menu>
      <MenuButton size="md" as={Button} rightIcon={<ChevronDown size="16" />}>
        {fileSort.property === "name"
          ? "Name"
          : fileSort.property === "size"
          ? "Size"
          : "Created At"}
      </MenuButton>
      <MenuList>
        <MenuItem
          onClick={() => {
            setFileSort({ property: "name", isAscending: fileSort.isAscending });
          }}
        >
          Name
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFileSort({ property: "size", isAscending: fileSort.isAscending });
          }}
        >
          Size
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFileSort({ property: "createdAt", isAscending: fileSort.isAscending });
          }}
        >
          Created At
        </MenuItem>
      </MenuList>
    </Menu>
    <IconButton
      aria-label="change-sort-direction"
      mx={1}
      onClick={() =>
        setFileSort({ property: fileSort.property, isAscending: !fileSort.isAscending })
      }
    >
      <ArrowsSort />
    </IconButton>
  </>
);

export default FileSortMenu;
