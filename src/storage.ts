/**
 * The storage contract ([RFC-0002](https://github.com/vishwajit-vm/strutvane/blob/main/docs/rfcs/0002-file-storage-and-uploads.md)).
 *
 * A {@link StorageDisk} is a place files live: a local folder, an S3 bucket, an Azure Blob
 * container. `@strutvane/framework` ships `local` and `memory` disks; `@strutvane/files` adds the
 * cloud drivers. Code only ever talks to this interface, so switching disks needs no code change.
 *
 * @module
 */

/** Who may read a file directly by URL. Private is the default and the safe choice. */
export type FileVisibility = 'private' | 'public'

/** File contents accepted by {@link StorageDisk.put}. Streams are preferred for large files. */
export type FileBody = ReadableStream<Uint8Array> | Uint8Array | string

/** Options for writing a file. */
export interface PutOptions {
  /** MIME type to store. Uploads use the type detected from the file's bytes, never the browser's. */
  readonly contentType?: string
  /** Defaults to `private`. */
  readonly visibility?: FileVisibility
  /** Small, non-sensitive metadata stored with the file. */
  readonly metadata?: Readonly<Record<string, string>>
}

/** Information about a stored file. */
export interface StoredFile {
  /** Name of the disk the file is on, e.g. `"local"`, `"s3"`. */
  readonly disk: string
  /** The storage key, e.g. `"tenant-1/invoices/018f…"`. Never derived from a client file name. */
  readonly key: string
  /** Size in bytes. */
  readonly size: number
  /** MIME type. */
  readonly contentType: string
  /** Lowercase hex SHA-256 of the contents (integrity checks and optional dedupe). */
  readonly sha256: string
  readonly visibility: FileVisibility
  /** The original (sanitised) client file name, for display and downloads only. */
  readonly originalName?: string
  /** ISO-8601 timestamp of when the file was written. */
  readonly createdAt: string
}

/** One page of a listing. */
export interface FileListPage {
  readonly items: readonly StoredFile[]
  /** Pass to the next {@link StorageDisk.list} call; absent on the last page. */
  readonly nextCursor?: string
}

/**
 * A storage backend. Implementations MUST:
 * - stream (never buffer whole large files in memory),
 * - reject keys containing `..`, a leading `/`, backslashes or control characters,
 * - make `delete` idempotent (deleting a missing file is not an error).
 */
export interface StorageDisk {
  /** Disk name as configured, e.g. `"local"`. */
  readonly name: string
  put(key: string, body: FileBody, options?: PutOptions): Promise<StoredFile>
  /** Read a file as a stream. Rejects with a not-found error if it doesn't exist. */
  get(key: string): Promise<ReadableStream<Uint8Array>>
  exists(key: string): Promise<boolean>
  /** File information, or `undefined` if it doesn't exist. */
  stat(key: string): Promise<StoredFile | undefined>
  delete(key: string): Promise<void>
  list(
    prefix: string,
    options?: { readonly cursor?: string; readonly limit?: number },
  ): Promise<FileListPage>
  /** A permanent URL for a `public` file. Rejects for private files. */
  url(key: string): Promise<string>
  /** A short-lived signed URL (default expiry: 300 seconds). */
  temporaryUrl(key: string, options?: { readonly expiresInSeconds?: number }): Promise<string>
}
