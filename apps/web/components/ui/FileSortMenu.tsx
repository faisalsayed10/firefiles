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


type Props = {
  setFileSort: React.Dispatch<React.SetStateAction<FileSortConfig>>;
	fileSort: FileSortConfig;
}

const FileSortMenu: React.FC<Props>= (props) => {
  return (
    <>
      <Menu>
        <MenuButton size="sm" as={Button} variant="ghost" rightIcon={<ChevronDown size="16" />}>
          { props.fileSort.property }
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => {props.setFileSort({property: "name", isAscending:props.fileSort.isAscending})}}>
            Name
          </MenuItem>
          <MenuItem onClick={() => {props.setFileSort({property: "size", isAscending:props.fileSort.isAscending})}}>
            Size
          </MenuItem>
          <MenuItem onClick={() => {props.setFileSort({property: "createdAt", isAscending:props.fileSort.isAscending})}}>
            Created At
          </MenuItem>
        </MenuList>
      </Menu>
      <IconButton aria-label="change-view" onClick={() => props.setFileSort({property: props.fileSort.property, isAscending: !props.fileSort.isAscending})}>
        <ArrowsSort />
      </IconButton>
    </>
  );
}

export default FileSortMenu;