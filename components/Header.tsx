import Link from "next/link";
import Image from "next/image";
import logo from "@/images/logo.png";
import logo2 from "@/images/logo2.png";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Button from "./Button";
import SearchBar from "./SearchBar";
import { CalendarPlus, TicketIcon } from "lucide-react";

function Header() {
  return (
    <div className="border-b bg-[#553b6d]">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="font-bold shrink-0">
            <Image
              src={logo}
              alt="logo"
              width={100}
              height={100}
              className="w-20 lg:w-22"
            />
          </Link>

          {/* signin/profile */}
          <div className="lg:hidden">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button white>Sign In</Button>
                {/* <button className=" bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">Sign In</button> */}
              </SignInButton>
            </SignedOut>
          </div>
        </div>
        {/* search bar */}
        <div className="w-full lg:max-w-2xl">
          <SearchBar />
        </div>

        <div className="hidden lg:block ml-auto">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/seller">
                <button className="bg-[#7adb78]/80 text-gray-800 font-semibold px-3 py-1.5 text-sm rounded-lg hover:bg-[#7adb78] hover:cursor-pointer transition flex gap-2 items-center justify-center">
                  <CalendarPlus className="h-4 w-4 text-[#553b6d]"/>
                  Create Event
                </button>
              </Link>

              <Link href="/tickets">
                <button className="bg-[#7adb78]/80 items-center justify-center text-gray-800 font-semibold px-3 py-1.5 text-sm rounded-lg hover:bg-[#7adb78] hover:cursor-pointer transition flex gap-2 items-center justify-center">
                  <TicketIcon className="h-4 w-4 text-[#553b6d]"/>
                  My Tickets
                </button>
              </Link>
              <UserButton />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button className="transition-all duration-200 text-gray-200">
                Sign In
              </Button>
              {/* <button className=" bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">Sign In</button> */}
            </SignInButton>
          </SignedOut>
        </div>

        <div className="lg:hidden w-full flex justify-center gap-3">
          <SignedIn>
            <Link href="/seller" className="flex-1">
              <button className="w-full bg-[#7adb78]/80 text-gray-800 font-semibold px-3 py-1.5 text-sm rounded-lg hover:bg-[#7adb78] hover:cursor-pointer transition flex gap-2 items-center justify-center">
                <CalendarPlus className="h-4 w-4 text-[#553b6d]"/>
                Create Event
              </button>
            </Link>

            <Link href="/tickets" className="flex-1">
              <button className="w-full bg-[#7adb78]/80 text-gray-800 font-semibold px-3 py-1.5 text-sm rounded-lg hover:bg-[#7adb78] hover:cursor-pointer transition flex gap-2 items-center justify-center">
                <TicketIcon className="h-4 w-4 text-[#553b6d]"/>
                My Tickets
              </button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Header;
