'use client';

import { Input } from '@/components/ui/input';
import { AddressAutofill } from '@mapbox/search-js-react';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import React, { useId } from 'react';

type AddressAutofillInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRetrieve: (res: AddressAutofillRetrieveResponse) => void;
  placeholder?: string;
  id?: string;
};

export default function AddressAutofillInput({
  value,
  onChange,
  onRetrieve,
  placeholder = 'Enter address',
  id,
}: AddressAutofillInputProps) {
  // Generate a unique ID if one isn't provided
  const uniqueId = useId();
  const inputId = id || `address-${uniqueId}`;
  
  return (
    <div className="relative">
      {/* Using a wrapper div instead of a form to avoid form nesting issues */}
      {/* @ts-expect-error - The AddressAutofill component has typing issues with Next.js */}
      <AddressAutofill
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}
        onRetrieve={onRetrieve}
        popoverOptions={{
          placement: 'bottom-start',
          flip: true,
          offset: 5,
        }}
      >
        <Input
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="address-line1"
          className="w-full"
        />
      </AddressAutofill>
    </div>
  );
} 