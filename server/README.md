start the server:
npm run dev

stop the server:
ctrl + c

kill the port where the server is running:
kill -9 $(lsof -ti :3001)
or
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9