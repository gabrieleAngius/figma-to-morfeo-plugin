import React, {useCallback} from 'react';

export const useDownload = () => {
    const ref = React.useRef<HTMLAnchorElement>(null);

    const downloadFile = useCallback(
        (file: File) => {
            if (ref.current) {
                ref.current.href = URL.createObjectURL(file);
                ref.current.download = file.name;
                ref.current.click();
            }
        },
        [ref]
    );

    const Download = useCallback(() => <a ref={ref} hidden />, []);

    return {Download, downloadFile};
};
