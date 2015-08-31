<p align="center">
  <img src="https://raw.githubusercontent.com/JavaGarcia/kronu/master/doc/kronu.png">
</p>

Now you can publish any UDP service behind a NAT or firewall, through Kronu.

###What is Kronu?
Kronu is the solution to show or test our projects on internet from localhost without need to have a public server in the cloud.

###How does this work?
The magic is create a UDP tunnel through a NAT traversal so establish and maintain a bidirectional connection between two endpoints

#<img src="https://raw.githubusercontent.com/JavaGarcia/kronu/master/doc/net-d.png">

###Run kronu
```sh
node kronu.js <IP-kserver> <Port-kserver> <IP-local> <Port-localService> [Remote Port]
```
###Run kserver
```sh
node kserver.js <IP-public> <Port-public>
```
### Made with :heart: in Colombia.
## License:

Kronu is licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html. 
