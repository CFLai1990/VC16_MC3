#!/bin/bash
rsync -avz --exclude=".*" client/ chufan.lai@192.168.10.9:/var/www/html/VC16_MC3/client/
rsync -avz --exclude=".*" server/ chufan.lai@192.168.10.9:/var/www/html/VC16_MC3/server/