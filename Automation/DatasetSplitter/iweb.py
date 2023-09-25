import os, tqdm
import shutil

def combine_text_files(input_dir, output_file, max_size_bytes):
    total_size = 0
    with open(output_file, 'w') as output:
        for filename in sorted(os.listdir(input_dir)):
            if filename.endswith('.txt'):
                filepath = os.path.join(input_dir, filename)
                with open(filepath, 'r') as input_file:
                    content = input_file.read()
                    content_size = len(content)
                    if total_size + content_size <= max_size_bytes:
                        output.write(content)
                        total_size += content_size
                    else:
                        remaining_space = max_size_bytes - total_size
                        output.write(content[:remaining_space])
                        break
    print('total size:',total_size)


def split_text_file(input_file, output_dir, num_files):
    with open(input_file, 'r') as input_file:
        content = input_file.read()
        print(len(content),len(content)/1024,len(content)/(1024*1024))
        chunk_size = len(content) // num_files
        print('chunk size:', chunk_size)
        for i in range(num_files):
            start = i * chunk_size
            end = start + chunk_size
            chunk_content = content[start:end]
            output_path = os.path.join(output_dir, f'doc{i+1}.dat')
            with open(output_path, 'w') as output_file:
                output_file.write(chunk_content)


def clean_output_directory(output_dir):
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

def smartchunk(input_dir,output_dir,num_files,sizebytes):
    chunk_size = sizebytes // num_files
    filelist=sorted(os.listdir(input_dir))
    pathlist=[]
    for filename in filelist:
            if filename.endswith('.txt'):
                filepath = os.path.join(input_dir, filename)   
                pathlist.append(filepath) 
    pos=0
    filenum=0
    with open(pathlist[filenum], 'r') as input_file:
        content = input_file.read()
    pbar=tqdm.tqdm(total=num_files)
    for i in range(num_files):
            start = pos
            
            if start + chunk_size<=len(content):
                end = start + chunk_size
                chunk_content = content[start:end]
                pos=end
            else:
                chunk_content=content[pos:]
                left=chunk_size-len(chunk_content)
                filenum=filenum+1
                print(len(content))
                with open(pathlist[filenum], 'r') as input_file:
                    content = input_file.read()
                chunk_content=chunk_content+content[:left]
                pos=left
            output_path = os.path.join(output_dir, f'doc{i+1}.dat')
            with open(output_path, 'w') as output_file:
                    output_file.write(chunk_content)
            pbar.update(1)
    pbar.close()



def main():
    input_dir = '/Users/yurysavateev/englishdata'
    output_file = 'combined.txt'
    output_dir = '/Users/yurysavateev/2500000F5MB/'
    num_files = 2500000
    max_combined_size_mb = 12500

    max_combined_size_bytes = max_combined_size_mb * 1024 * 1024
    #clean_output_directory(output_dir)
    #combine_text_files(input_dir, output_file, max_combined_size_bytes)

    #split_text_file(output_file, output_dir, num_files)
    #os.remove(output_file)
    smartchunk(input_dir,output_dir,num_files,max_combined_size_bytes)

if __name__ == "__main__":
    main()
