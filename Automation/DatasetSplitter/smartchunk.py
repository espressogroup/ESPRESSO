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

input_dir = argv[1]

output_dir = argv[2]
    #num_files = 2500000
num_files = argv[3]
    #max_combined_size_mb = 12500
max_combined_size_mb=argv[4]
    
max_combined_size_bytes = max_combined_size_mb * 1024 * 1024
    #clean_output_directory(output_dir)
    #combine_text_files(input_dir, output_file, max_combined_size_bytes)

    #split_text_file(output_file, output_dir, num_files)
    #os.remove(output_file)
smartchunk(input_dir,output_dir,num_files,max_combined_size_bytes)
