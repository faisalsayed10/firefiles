import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger as PopTrigger,
  Portal,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import { DotsVertical } from "tabler-icons-react";

export const PopoverTrigger: React.FC<{ children: React.ReactNode }> = PopTrigger;

interface Props {
  header: string;
  footer?: string;
}

const OptionsPopover: React.FC<PropsWithChildren<Props>> = ({ header, footer, children }) => {
  return (
    <Popover isLazy>
      <PopoverTrigger>
        <IconButton aria-label="dots-vertical" variant="link" size="xs">
          <DotsVertical width="20" height="20" color={useColorModeValue("black", "white")} />
        </IconButton>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="250px">
          <PopoverArrow />
          <PopoverHeader>
            <Text fontSize="sm" fontWeight="semibold" isTruncated={true}>
              {header}
            </Text>
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody p="0">{children}</PopoverBody>
          {footer && (
            <PopoverFooter fontSize="xs" fontWeight="600" fontStyle="italic">
              {footer}
            </PopoverFooter>
          )}
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default OptionsPopover;
