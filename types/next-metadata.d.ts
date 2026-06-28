declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module 'next/server.js' {
  export type { NextRequest, NextResponse } from 'next/server';
}

declare module 'next/navigation.js' {
  export * from 'next/navigation';
}

declare module 'next/link.js' {
  export * from 'next/link';
}

declare module 'next/image.js' {
  export * from 'next/image';
}
