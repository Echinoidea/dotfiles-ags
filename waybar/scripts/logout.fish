#!/usr/bin/env fish

# Display the options
echo "What would you like to do?"
echo "1) Shutdown"
echo "2) Reboot"
echo "3) Suspend"

# Read user input
echo "Enter the number of your choice: " 
read -p choice

# Handle the user choice with systemctl commands
switch $choice
    case 1
        echo "Shutting down..."
        systemctl poweroff
    case 2
        echo "Rebooting..."
        systemctl reboot
    case 3
        echo "Suspending..."
        systemctl suspend
    case '*'
        echo "Invalid option. Exiting."
end
