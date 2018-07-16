module.exports = {
    apps : [{
        name   : "web-wallet",
        script : "app.js",
        watch  : true,
        env_production : {
            PORT : 80
        }
    }],
    deploy : {
        production : {
            user : "root",
            host : ["101.132.121.47"],
            ref  : "origin/master",
            repo : "git@github.com:opteacher/web-wallet.git",
            path : "/var/www/production",
            ssh_options : "StrictHostKeyChecking=no",
            "pre-setup" : "sudo apt-get install git",
            "post-setup": "ls -la",
            "pre-deploy-local" : "npm install webpack -g && npm install webpack-cli -D",
            "post-deploy"      : "chmod -x ecosystem.config.js && npm install && webpack -p && pm2 startOrRestart ecosystem.config.js --env production",
            env  : { PORT : 80 }
        },
        staging    : {
            user : "root",
            host : "101.132.121.47",
            ref  : "origin/master",
            repo : "git@github.com:opteacher/web-wallet.git",
            path : "/var/www/development",
            ssh_options   : [
                "StrictHostKeyChecking=no",
                "PasswordAuthentication=no"
            ],
            "pre-deploy-local": "npm install webpack -g && npm install webpack-cli -D",
            "post-deploy"     : "pm2 startOrRestart ecosystem.json --env dev"
        }
    }
}
