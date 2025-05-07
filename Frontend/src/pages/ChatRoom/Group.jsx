import ChatRooms from "./Rooms";
import Chat from "./Chat";

export default function Groups(){
       
    return(
        <div className="flex pt-20 bg-white border-[2px]">
  <div className="w-1/3 ">
    <ChatRooms />
  </div>
  <div className="w-2/3">
    <Chat />
  </div>
</div>

    );
}