import { IconButton, Input, useColorModeValue } from "@chakra-ui/react";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { Provider } from "@util/types";
import { nanoid } from "nanoid";
import React, { useEffect, useRef } from "react";
import { FileUpload } from "tabler-icons-react";

interface Props {
  filesToUpload: File[];
  setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
}

const UploadFileButton: React.FC<Props> = ({ filesToUpload, setFilesToUpload }) => {
  const { addFile, loading, uploadingFiles, currentFolder } = useBucket();
  const fileInput = useRef<HTMLInputElement>();

  useEffect(() => {
    if (!filesToUpload || filesToUpload.length < 1) return;
    handleUpload(null, filesToUpload);
  }, [filesToUpload]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, filesToUpload: File[]) => {
    const files = filesToUpload || e?.target.files;
    if (!currentFolder || !files || files?.length < 1) return;

    await addFile(files);
    setFilesToUpload([]);
  };

  return (
    <>
      <Input
        type="file"
        ref={fileInput}
        hidden={true}
        onChange={(e) => handleUpload(e, null)}
        key={nanoid()}
        multiple
      />
      <IconButton
        disabled={
          uploadingFiles.filter((uploadingFile) => !uploadingFile.error).length > 0 || loading
        }
        pos="fixed"
        p="4"
        borderRadius="50%"
        w="60px"
        h="60px"
        bottom="2rem"
        right="2rem"
        variant="outline"
        bgColor={useColorModeValue("white", "#1a202c")}
        _focus={{ outline: "none" }}
        _hover={{ opacity: 1 }}
        boxShadow="4.2px 4px 6.5px -1.7px rgba(0, 0, 0, 0.4)"
        colorScheme="green"
        aria-label="upload file"
        onClick={() => fileInput.current.click()}
      >
        <FileUpload size="42px" />
      </IconButton>
    </>
  );
};

export default UploadFileButton;
