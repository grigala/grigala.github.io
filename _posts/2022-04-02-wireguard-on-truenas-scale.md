---
title: 'WireGuard on TrueNAS SCALE'
date: 2022-04-02
permalink: /posts/2022/04/wireguard-on-truenas-scale
redirect_from:
tags:
  - NAS
  - VPN
  - TrueNAS
  - WireGuard
excerpt: 'WireGuard on TrueNAS Scale'
---
{% include base_path %}
{% include toc %}
<link href="{{ base_path }}/assets/css/blog-en.css" rel="stylesheet">

> DISCLAIMER: I'm not claiming to be an expert of the tools mentioned in this
article, thereby, I'm not responsible for any troubles you might cause/experience
on your system by executing commands found in this article. Use at your own risk
and do your own research.

<details>
  <summary style="font-family: 'Playfair Display'">
  As the weather kinda decided to ruin my plans for today during the god damn mid-spring,
  I decided to make myself cozy and tinker with my <b>90 TB</b> TrueNAS SCALE system.

  </summary>
  <img src="{{ base_path }}/images/IMG_20220402.jpg">
</details>
---
The goal is to somehow hook it up with my WireGuard VPN tunnel that is running
in a test mode on my Raspberry Pi under the desk. It will eventually end up on
somewhat more stable and better performant Pi-Cluster also chilling under my
desk. This will allow me to keep my NAS accessible from anywhere without
exposing it to the public networks and thus, be more secure. By the way, I must
say that exposing a NAS system to the public network is very dangerous business
and not recommended by anyone including me. Having it behind a VPN on the other
hand, is always a recommended way to achieve the same goal of having access to
your precious data from anywhere - given you have the your VPN connection figured
out and configured properly.

## Intro

Configuring the WireGuard VPN in the TrueNAS systems used to be quite an easy
task. Until they've released their new Linux based(as opposed to FreeBSD in case of TrueNAS Core) TrueNAS SCALE(and obviously 
I've jumped on it, like a maniac) which is going to be a big hit for people 
who are actively using virtualization software like
Docker and Kubernetes. Now, in most use-cases people are running VPN of of their NAS directly,
however, in my case, as mentioned previously, I have a dedicated system for it.
So in this situation I just want to hook up my NAS to an already existing WireGuard server.

<pre class="language-bash" style="font-size: 17px;"><code>
pi@raspberrypi:~ $ pivpn -c
::: Connected Clients List :::
Name          Remote IP      Virtual IP      Bytes Received      Bytes Sent      Last Seen
S22Plus       *********      10.6.0.2        3.5MiB              43MiB           Apr 02 2022
Thinkpad      *********      10.6.0.3        245MiB              48GiB           Apr 02 2022
iPad          *********      10.6.0.4        113KiB              724MiB          Apr 02 2022
MBP           *********      10.6.0.5        151KiB              413KiB          Apr 02 2022
::: Disabled clients :::
</code>
</pre>

Just add another configuration to the interface and copy it over to the NAS system!

## Configuration

Since TrueNAS SCALE retains the /root directory between updates, we can store our [wg-quick](https://manpages.debian.org/unstable/wireguard-tools/wg-quick.8.en.html){:target="_blank"} Configuration in `/root/` and use `wg-quick up` provided by [wireguard-tools](https://git.zx2c4.com/wireguard-tools){:target="_blank"} to create and spin up our VPN.

Simply create or download your configuration file and save it to `/root/wg0.conf`. An example is provided below.

Then navigate to System Settings > Advanced > Init/Shutdown Scripts and create a new entry

<pre style="font-size: 17px;">
Description: Wireguard VPN
Type: Command
Command: wg-quick up /root/wg0.conf
When: Post Init
Enabled: True
Timeout: 10
</pre>


`/root/wg0.conf`
<pre style="font-size: 17px;">
<code>
[Interface]
PrivateKey = 4ITVmRuCbdZ2fBOgkJVeVxaJIqh5TEGYpki+TBFvMW8=
Address = 10.6.0.6/32

[Peer]
PublicKey = AF2gxhJmco7srsbU+clix40wsngeLKpycd4+316T7DA=
AllowedIPs = 10.6.0.1/24
Endpoint = raspberrypi:51820
</code>
</pre>

You should now be connected via WireGuard!