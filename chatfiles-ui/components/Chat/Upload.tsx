import { LlamaIndex } from "@/types";
import { CHAT_FILES_MAX_SIZE } from "@/utils/app/const";
import { humanFileSize } from "@/utils/app/files";

interface Props {
    onIndexChange: (indexes: LlamaIndex[]) => void
    handleIsUploading: (isUploading: boolean) => void;
    handleIsUploadSuccess: (isUploadSuccess: boolean) => void;
    handleUploadError: (error: string) => void;
}
export const Upload = ({ onIndexChange, handleIsUploading, handleIsUploadSuccess, handleUploadError }: Props) => {

    const handleFiles = async (files: File[]) => {
        if (!validateFiles(files)) {
            handleIsUploadSuccess(false);
            return;
        }

        handleIsUploading(true);

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);

            });
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const indexNames = (await response.json() as { Index_names: LlamaIndex[] }).Index_names;
            onIndexChange(indexNames);
            handleIsUploading(false);
            handleIsUploadSuccess(true)
        } catch (e) {
            console.error('EROR:_---_:', e);
            handleUploadError((e as Error).message);
            handleIsUploading(false);
            handleIsUploadSuccess(false)
        }
    };

    const validateFiles = (files: File[]) => {
        for (const file of files) {
            if (CHAT_FILES_MAX_SIZE !== 0 && file.size > CHAT_FILES_MAX_SIZE) {
                handleUploadError(`Please select a file smaller than ${humanFileSize(CHAT_FILES_MAX_SIZE)}`);
                return false;
            }
        }
        return true;
    };

    return (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or
                        drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">File supported types: TXT, PDF, EPUB, Markdown...</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple onChange={(e) => {
                    if (e.target.files) {
                        handleFiles(Array.from(e.target.files));
                    }
                }} />
            </label>
        </div>
    );
}