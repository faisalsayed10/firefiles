import {
	IconButton,
	Button,
	MenuItem,
	Menu,
	MenuList,
	MenuButton,
} from "@chakra-ui/react";
import React from "react";
import { FileSortConfig } from "@util/types";
import { ChevronDown, ArrowsSort } from "tabler-icons-react";


const FileSortMenu: React.FC<{
  setFileSort: React.Dispatch<React.SetStateAction<FileSortConfig>>;
  fileSort: FileSortConfig;
}> = ({ fileSort, setFileSort }) => (
  <>
    <Menu>
      <MenuButton size="sm" as={Button} variant="ghost" rightIcon={<ChevronDown size="16" />}>
        {fileSort.property}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => { setFileSort({ property: "name", isAscending: fileSort.isAscending }); }}>
          Name
        </MenuItem>
        <MenuItem onClick={() => { setFileSort({ property: "size", isAscending: fileSort.isAscending }); }}>
          Size
        </MenuItem>
        <MenuItem onClick={() => { setFileSort({ property: "createdAt", isAscending: fileSort.isAscending }); }}>
          Created At
        </MenuItem>
      </MenuList>
    </Menu>
    <IconButton aria-label="change-view" onClick={() => setFileSort({ property: fileSort.property, isAscending: !fileSort.isAscending })}>
      <ArrowsSort />
    </IconButton>
  </>
)

export default FileSortMenu;
