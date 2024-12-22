'use client';

import Button from '@/components/button/Button';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

const Page = () => {
  const googleAuthHandler = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="flex flex-col gap-8 justify-center items-center h-[100dvh]">
      <h1 className="text-3xl font-extrabold">@Todo</h1>
      <div className="flex justify-center items-center bg-gray-100 rounded-full w-[300px] h-[300px]">
        <Image src="/logo.png" width={260} height={260} alt="plot logo" priority />
      </div>
      <form action={googleAuthHandler} className="mt-8">
        <Button
          type="submit"
          className="flex items-center space-x-2 py-2 px-10 pl-[1.5rem] border bg-white border-gray-300 text-primary text-lg font-semibold"
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={0}
            height={0}
            className="w-[40px] h-auto "
          />
          <p>Sign in with Google</p>
        </Button>
      </form>
    </div>
  );
};

export default Page;
