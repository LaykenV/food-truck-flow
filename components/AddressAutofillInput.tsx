'use client';

import { Input } from '@/components/ui/input';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import React, { useId, useEffect, useState } from 'react';

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
  const [AddressAutofill, setAddressAutofill] = useState<any>(null);
  
  useEffect(() => {
    // Only import and use the component on the client side
    import('@mapbox/search-js-react').then((mod) => {
      setAddressAutofill(mod.AddressAutofill);
    });
  }, []);
  
  // When component hasn't loaded yet, just show the input
  if (!AddressAutofill) {
    return (
      <div className="relative">
        <Input
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full"
        />
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Using a wrapper div instead of a form to avoid form nesting issues */}
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
          autoComplete="off"
          className="w-full"
        />
      </AddressAutofill>
    </div>
  );
} 