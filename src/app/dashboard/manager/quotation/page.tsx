"use client"
import { Button } from '@/components/ui/button';
import React from 'react';
import {  useSearchParams } from "next/navigation";
import Link from 'next/link';

const Page = () => {
  const searchParams = useSearchParams();
  
  return (
    <div>
      <div className='flex justify-end py-8 pr-16'>
        <Link href="/dashboard"><Button>Cancel</Button>
        </Link>
        </div>
      <div>
        
        <h1>{searchParams.get('rfp')}</h1>
      </div>
    </div>
  );
};

export default Page;
