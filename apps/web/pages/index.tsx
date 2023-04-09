import OptionsPopover from "@components/popups/OptionsPopover";
import AddDriveButton from "@components/ui/AddDriveButton";
import Navbar from "@components/ui/Navbar";
import useUser from "@hooks/useUser";
import { Drive } from "@prisma/client";
import { PROVIDERS } from "@util/globals";
import { deleteDrive } from "@util/helpers";
import { Provider } from "@util/types";
import gravatar from "gravatar";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import useSWR from "swr";
import { X } from "tabler-icons-react";

const Dashboard = () => {
  const router = useRouter();
  const { user } = useUser({ redirectTo: "/login" });
  const { data, isValidating, mutate } = useSWR<Drive[]>(`/api/drive`);

  // const optionProps = {
  //   p: 2,
  //   cursor: "pointer",
  //   _hover: { backgroundColor: useColorModeValue("gray.100", "rgba(237, 242, 247, 0.1)") },
  // };

  return (
    <>
      <Head>
        <title>Your Drives | Firefiles</title>
        <meta charSet="utf-8" />
      </Head>
      <div className="flex flex-col">
        <Navbar />
        <div className="my-4 sm:flex-col md:mx-8 mx4">
          <Image
            src={gravatar.url(user?.email, {
              s: "110",
              protocol: "https",
            })}
            alt="Profile Picture"
            width={110}
            height={110}
            className="rounded-full ml-4"
          />
          <div className="ml-4">
            <h1 className="text-2xl font-semibold">
              👋 Hello There!
            </h1>
            <div className='flex items-baseline'>
              <p>
                <strong>Your Email:</strong> {user?.email}
              </p>
            </div>
            <div className="flex items-baseline">
              <strong>Current Plan: </strong>
              {/* <Tag variant="solid" colorScheme="purple" ml="1">
                {user?.plan} Plan
              </Tag> */}
              <button className="ml-1">
                Upgrade
              </button>
            </div>
            <button>View Payment Settings</button>
          </div>
        </div>
        <hr />
        <div className="mx-4 md:mx-8">
          <h1 className="text-3xl font-semibold my-3">
            Your Drives
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!data && isValidating ? (
              <>
                <Skeleton height="140px" width="100%" borderRadius="lg" />
                <Skeleton height="140px" width="100%" borderRadius="lg" />
                <Skeleton height="140px" width="100%" borderRadius="lg" />
                <Skeleton height="140px" width="100%" borderRadius="lg" />
              </>
            ) : (
              data?.map((drive) => (
                <div
                  key={drive.id}
                  className="hoverAnim cursor-pointer flex-col items-center rounded-lg shadow-lg w-full h-[140px] border transition-all duration-100 ease-in-out"
                >
                  <div className="flex-1 w-full mt-2" onClick={() => router.push(`/drives/${drive.id}`)}>
                    <Image
                      alt="Provider Logo"
                      src={PROVIDERS.filter((p) => p.id === drive.type)[0].logo}
                      width={90}
                      className="m-auto"
                    />
                  </div>
                  <div className="flex p-2 w-full justify-between items-center">
                    <p
                      onClick={() => router.push(`/drives/${drive.id}`)}
                      className="flex-1 truncate text-sm text-left px-2"
                    >
                      {drive.name}
                    </p>
                    <OptionsPopover header={drive.name}>
                      <div className="items-stretch flex-col">
                        <div
                          // {...optionProps}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteDrive(Provider[drive.type], drive.id);
                            mutate(data.filter((b) => b.id !== drive.id));
                          }}
                        >
                          <X />
                          <p className="ml-2">Delete Drive</p>
                        </div>
                      </div>
                    </OptionsPopover>
                  </div>
                </div>
              ))
            )}
            <AddDriveButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
